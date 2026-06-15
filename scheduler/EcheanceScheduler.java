package com.ipnet.rentalapi.Gbails.scheduler;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.ipnet.rentalapi.Gbails.Enums.BailEnum;
import com.ipnet.rentalapi.Gbails.Enums.TypeNotification;
import com.ipnet.rentalapi.Gbails.dto.request.NotificationRequest;
import com.ipnet.rentalapi.Gbails.models.ContratBail;
import com.ipnet.rentalapi.Gbails.models.Echeance;
import com.ipnet.rentalapi.Gbails.repository.ContratBailRepository;
import com.ipnet.rentalapi.Gbails.repository.EcheanceRepository;
import com.ipnet.rentalapi.Gbails.service.EcheanceService;
import com.ipnet.rentalapi.Gbails.service.NotificationService;

/**
 * Scheduler de gestion des échéances de loyer.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  JOB 1 — 1er de chaque mois à 08h00                                │
 * │  → Génère les échéances mensuelles pour tous les contrats actifs    │
 * │  → Idempotent : saute si l'échéance du mois existe déjà            │
 * │  → Arrête de générer si dateSortie est dépassée                    │
 * │                                                                     │
 * │  JOB 2 — Tous les jours à 09h00                                    │
 * │  → Marque EN_RETARD les échéances non payées dont la date est      │
 * │    dépassée, et envoie une notification d'alerte                    │
 * └─────────────────────────────────────────────────────────────────────┘
 */
@Component
public class EcheanceScheduler {

    private static final Logger log = LoggerFactory.getLogger(EcheanceScheduler.class);

    private final ContratBailRepository contratBailRepository;
    private final EcheanceService echeanceService;
    private final EcheanceRepository echeanceRepository;
    private final NotificationService notificationService;

    public EcheanceScheduler(
            ContratBailRepository contratBailRepository,
            EcheanceService echeanceService,
            EcheanceRepository echeanceRepository,
            NotificationService notificationService
    ) {
        this.contratBailRepository = contratBailRepository;
        this.echeanceService = echeanceService;
        this.echeanceRepository = echeanceRepository;
        this.notificationService = notificationService;
    }

    // ─── JOB 1 : Génération mensuelle des échéances ───────────────────────────

    /**
     * S'exécute le 1er de chaque mois à 08h00 (heure serveur).
     *
     * Cron : "0 0 8 1 * ?"
     *   └── secondes  : 0
     *   └── minutes   : 0
     *   └── heures    : 8
     *   └── jour/mois : 1 (le 1er)
     *   └── mois      : * (tous les mois)
     *   └── jour/sem  : ? (non spécifié)
     *
     * Stratégie d'idempotence :
     *   Avant de créer une échéance, on vérifie en base si une échéance
     *   existe déjà pour ce contrat sur ce (mois, année). Si oui → skip.
     *   Ainsi, même si l'application redémarre en cours de traitement,
     *   le scheduler peut être relancé sans créer de doublons.
     */
    @Scheduled(cron = "0 0 8 1 * ?")
    @Transactional
    public void genererEcheancesMensuelles() {
        log.info("=== [SCHEDULER] Génération des échéances mensuelles — {}", LocalDate.now());

        LocalDate maintenant = LocalDate.now();
        YearMonth moisCourant = YearMonth.now();

        List<ContratBail> contratsActifs = contratBailRepository.findByStatut(BailEnum.ACTIF);
        log.info("[SCHEDULER] {} contrat(s) actif(s) à traiter", contratsActifs.size());

        int crees = 0;
        int skipped = 0;
        int termines = 0;

        for (ContratBail contrat : contratsActifs) {
            try {
                String resultat = traiterContrat(contrat, maintenant, moisCourant);
                switch (resultat) {
                    case "CREE"    -> crees++;
                    case "SKIP"    -> skipped++;
                    case "TERMINE" -> termines++;
                }
            } catch (Exception e) {
                // On logue l'erreur mais on continue avec les autres contrats
                log.error("[SCHEDULER] Erreur sur le contrat {} : {}",
                        contrat.getUuid(), e.getMessage(), e);
            }
        }

        log.info("[SCHEDULER] Terminé — créées: {}, déjà existantes: {}, contrats terminés: {}",
                crees, skipped, termines);
    }

    /**
     * Traite un contrat individuel.
     * Retourne "CREE", "SKIP" ou "TERMINE".
     */
    private String traiterContrat(ContratBail contrat, LocalDate maintenant, YearMonth moisCourant) {

        // ── 1. Vérifier si le contrat est arrivé à terme ──────────────────
        if (contrat.getDateSortie() != null && !maintenant.isBefore(contrat.getDateSortie())) {
            log.debug("[SCHEDULER] Contrat {} terminé (dateSortie = {}), skip.",
                    contrat.getUuid(), contrat.getDateSortie());

            // Clôturer automatiquement le contrat si la dateSortie est dépassée
            if (contrat.getStatut() == BailEnum.ACTIF) {
                contrat.setStatut(BailEnum.TERMINE);
                contratBailRepository.save(contrat);
                log.info("[SCHEDULER] Contrat {} passé en statut TERMINE.", contrat.getUuid());
            }
            return "TERMINE";
        }

        // ── 2. Vérifier l'idempotence : une échéance existe-t-elle déjà ? ─
        boolean dejaCree = echeanceService.echeanceExisteDeja(
                contrat.getUuid(),
                moisCourant.getYear(),
                moisCourant.getMonthValue()
        );

        if (dejaCree) {
            log.debug("[SCHEDULER] Échéance {}/{} déjà présente pour le contrat {}, skip.",
                    moisCourant.getMonthValue(), moisCourant.getYear(), contrat.getUuid());
            return "SKIP";
        }

        // ── 3. Calculer la date d'échéance ────────────────────────────────
        // Le jourEcheance est le jour du mois de paiement (ex: 5 = avant le 5)
        // Si le mois n'a pas ce jour (ex: 30 février), on prend le dernier jour du mois.
        int jourMax = moisCourant.lengthOfMonth();
        int jourEcheance = Math.min(contrat.getJourEcheance(), jourMax);
        LocalDate dateEcheance = moisCourant.atDay(jourEcheance);

        // ── 4. Créer l'échéance ────────────────────────────────────────────
        echeanceService.creerEcheance(contrat, dateEcheance);

        // ── 5. Envoyer la notification de rappel de loyer ─────────────────
        String message = String.format(
                "Bonjour %s, votre loyer de %.0f FCFA pour l'unité %s est à régler avant le %s.",
                contrat.getLocataire().getNomComplet(),
                contrat.getLoyer(),
                contrat.getUnite().getCode_unite(),
                dateEcheance
        );
       
        notificationService.creerNotification(
        		 new NotificationRequest(
        	        		contrat.getLocataire(),
        	                "Rappel de loyer — " + moisCourant.getMonth().name(),
        	                message,
        	                TypeNotification.RELANCE_LOYER
        	          )
        		);

        log.info("[SCHEDULER] Échéance créée pour contrat {} — montant: {} FCFA, date: {}",
                contrat.getUuid(), contrat.getLoyer(), dateEcheance);

        return "CREE";
    }

    // ─── JOB 2 : Détection et relance des retards ─────────────────────────────

    /**
     * S'exécute tous les jours à 09h00.
     * Marque les échéances non payées dont la date est dépassée comme EN_RETARD
     * et envoie une notification d'alerte au locataire.
     */
    @Scheduled(cron = "0 0 9 * * ?")
    @Transactional
    public void detecterEtNotifierRetards() {
        log.info("=== [SCHEDULER] Détection des retards — {}", LocalDate.now());

        // Récupère toutes les échéances EN_ATTENTE ou PARTIELLEMENT_PAYE dont la date est passée
        List<Echeance> enRetard = echeanceRepository.findEcheancesEnRetard(LocalDate.now());

        for (Echeance echeance : enRetard) {
            try {
                // Mettre à jour le statut
                echeance.setStatut(com.ipnet.rentalapi.Gbails.Enums.StatutEcheance.EN_RETARD);
                echeanceRepository.save(echeance);

                // Envoyer une notification d'alerte
                String message = String.format(
                        "Bonjour %s, votre loyer de %.0f FCFA pour l'unité %s était dû le %s. " +
                        "Merci de régulariser votre situation au plus vite.",
                        echeance.getContratBail().getLocataire().getNomComplet(),
                        echeance.getMontantRestant(),
                        echeance.getContratBail().getUnite().getCode_unite(),
                        echeance.getDateEcheance()
                );
                
                notificationService.creerNotification(
                		new NotificationRequest(
                        		echeance.getContratBail().getLocataire(),
                                " Loyer en retard",
                                message,
                                TypeNotification.ALERTE_RETARD
                        ) 
                );

                log.info("[SCHEDULER] Retard signalé pour l'échéance {} (contrat {})",
                        echeance.getUuid(),
                        echeance.getContratBail().getUuid());

            } catch (Exception e) {
                log.error("[SCHEDULER] Erreur sur l'échéance {} : {}", echeance.getUuid(), e.getMessage(), e);
            }
        }

        log.info("[SCHEDULER] {} retard(s) détecté(s) et notifié(s)", enRetard.size());
    }
}