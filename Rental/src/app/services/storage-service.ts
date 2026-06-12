import { Injectable } from '@angular/core';
import {createClient, SupabaseClient} from '@supabase/supabase-js';
import {environment} from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  private supabase: SupabaseClient;

  constructor() {
    // Remplacez par vos vraies clés disponibles sur votre tableau de bord Supabase
    const supabaseUrl = environment.supabaseUrl;
    const supabaseKey = environment.supabaseKey;

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadAvatar(file: File, userId: string): Promise<string | null> {
    try {
      // Générer un nom de fichier unique (ex: avatars/user_123.jpg)
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `profile_pictures/${fileName}`;

      // 1. Envoyer le fichier dans le bucket 'avatars'
      const { error } = await this.supabase.storage
        .from('avatars')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      // 2. Récupérer l'URL publique de l'image stockée
      const { data } = this.supabase.storage.from('avatars').getPublicUrl(filePath);

      return data.publicUrl; // Retourne l'URL directe (ex: https://.../profile_pictures/user_123.jpg)
    } catch (error) {
      console.error("Erreur d'upload Supabase :", error);
      return null;
    }
  }
}
