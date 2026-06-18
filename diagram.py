import xml.dom.minidom as minidom

class Ids:
    def __init__(self, start=1):
        self.n = start
    def next(self):
        self.n += 1
        return str(self.n)

ids = Ids()
cells = []

def esc(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;')
             .replace('>', '&gt;').replace('"', '&quot;'))

def boundary(name, x, y, w, h):
    cid = ids.next()
    cells.append(
        f'<mxCell id="{cid}" value="{esc(name)}" '
        f'style="rounded=0;whiteSpace=wrap;html=1;verticalAlign=top;align=center;'
        f'fillColor=none;strokeColor=#000000;fontStyle=1;fontSize=13;" '
        f'vertex="1" parent="1"><mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>'
    )
    return cid

def actor(name, x, y):
    cid = ids.next()
    cells.append(
        f'<mxCell id="{cid}" value="{esc(name)}" '
        f'style="shape=umlActor;whiteSpace=wrap;html=1;verticalLabelPosition=bottom;'
        f'verticalAlign=top;outlineConnect=0;fillColor=#ffffff;strokeColor=#000000;" '
        f'vertex="1" parent="1"><mxGeometry x="{x}" y="{y}" width="40" height="70" as="geometry"/></mxCell>'
    )
    return cid

def usecase(name, x, y, w=220, h=50):
    cid = ids.next()
    cells.append(
        f'<mxCell id="{cid}" value="{esc(name)}" '
        f'style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontSize=11;" '
        f'vertex="1" parent="1"><mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>'
    )
    return cid

def link(src, tgt, label="", dashed=False, arrow=False):
    eid = ids.next()
    style = "edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;fontSize=10;"
    style += "endArrow=open;" if arrow else "endArrow=none;"
    style += "dashed=1;" if dashed else "dashed=0;"
    cells.append(
        f'<mxCell id="{eid}" value="{esc(label)}" style="{style}" '
        f'edge="1" parent="1" source="{src}" target="{tgt}">'
        f'<mxGeometry relative="1" as="geometry"/></mxCell>'
    )
    return eid

# ---- Boundary system ----
b = boundary("Plateforme de gestion locative", 120, 30, 760, 770)

# ---- Shared use case ----
uc_auth = usecase("S'authentifier", 380, 70, 240)

# ---- Acteur PROPRIETAIRE ----
act_proprio = actor("PROPRIETAIRE", 10, 420)

proprio_ucs = [
    "Gerer les biens",
    "Gerer les unites",
    "Gerer les locataires",
    "Gerer les contrats de bail",
    "Resilier un contrat",
    "Gerer les echeances",
    "Enregistrer un paiement (especes)",
    "Consulter l'historique des paiements",
    "Gerer les biens de sejour (Airbnb)",
]
y = 150
proprio_uc_ids = []
for name in proprio_ucs:
    cid = usecase(name, 160, y, 230)
    proprio_uc_ids.append(cid)
    y += 70

# ---- Acteur LOCATAIRE ----
act_locataire = actor("LOCATAIRE", 920, 350)

locataire_ucs = [
    "Consulter mes contrats",
    "Consulter mes echeances",
    "Effectuer un paiement Mobile Money",
    "Consulter mes notifications",
    "Marquer une notification comme lue",
    "Mettre a jour mon profil",
]
y = 150
locataire_uc_ids = []
for name in locataire_ucs:
    cid = usecase(name, 560, y, 230)
    locataire_uc_ids.append(cid)
    y += 70

# ---- Use case webhook + acteur secondaire systeme FedaPay ----
uc_webhook = usecase("Confirmer le paiement (webhook)", 560, 640, 230)
act_fedapay = actor("Systeme FedaPay", 920, 630)

# ---- Associations acteur - cas d'utilisation ----
link(act_proprio, uc_auth)
for cid in proprio_uc_ids:
    link(act_proprio, cid)

link(act_locataire, uc_auth)
for cid in locataire_uc_ids:
    link(act_locataire, cid)

link(act_fedapay, uc_webhook)

# ---- Relation d'inclusion ----
link(locataire_uc_ids[2], uc_webhook, label="<<include>>", dashed=True, arrow=True)

xml_cells = "\n        ".join(cells)

xml_doc = f'''<mxfile host="app.diagrams.net" version="24.0.0" type="device">
  <diagram id="usecase-locatif" name="Cas d'utilisation">
    <mxGraphModel dx="800" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1190" pageHeight="900" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        {xml_cells}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
'''

# Validate well-formed XML
dom=minidom.parseString(xml_doc)



print("OK - cas_utilisation.drawio genere, taille:", len(xml_doc), "octets")
xml_en_octets = dom.toprettyxml(indent="  ", encoding="utf-8")

# 2. Écrire le résultat dans un fichier en mode binaire ('wb')
with open("mon_fichier.xml", "wb") as fichier:
    fichier.write(xml_en_octets)
