import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { VideoItem, VideoCategory } from '../types';

const LOCAL_VIDEOS_KEY = 'china_hut_local_videos';

const DEFAULT_VIDEOS: VideoItem[] = [
  {
    id: 'vid-southmoon-demo',
    title: 'সাউথমুন লাইপোমা রিমুভাল স্প্রে (৫০ মিলি) প্যাকেজিং ও ডেমো',
    description: 'আসল আমদানিকৃত ইনট্যাক্ট বক্স ও ৫০ মিলি স্প্রে বোতল পরিচিতি ও ব্যবহার নির্দেশিকা।',
    videoUrl: '/assets/videos/products/southmoon_demo.mp4',
    thumbnailUrl: '/assets/images/products/southmoon_box_and_bottle.png',
    category: 'product',
    isPublished: true,
    fileSize: 91136,
    duration: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getLocalVideos(): VideoItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_VIDEOS_KEY);
    if (!raw) return DEFAULT_VIDEOS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_VIDEOS;
  } catch {
    return DEFAULT_VIDEOS;
  }
}

export function saveLocalVideos(videos: VideoItem[]) {
  try {
    localStorage.setItem(LOCAL_VIDEOS_KEY, JSON.stringify(videos));
  } catch (err) {
    console.warn('Could not save local videos:', err);
  }
}

/**
 * Fetches all videos.
 */
export async function fetchAllVideos(): Promise<VideoItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((v) => ({
          id: v.id,
          title: v.title,
          description: v.description || '',
          videoUrl: v.video_url,
          thumbnailUrl: v.thumbnail_url || '',
          category: (v.category as VideoCategory) || 'product',
          isPublished: Boolean(v.is_published),
          fileSize: v.file_size ? Number(v.file_size) : undefined,
          duration: v.duration ? Number(v.duration) : undefined,
          createdAt: v.created_at,
          updatedAt: v.updated_at,
        }));
      }
    } catch (err) {
      console.warn('fetchAllVideos Supabase error:', err);
    }
  }

  return getLocalVideos();
}

/**
 * Fetches the currently published video for the landing page.
 */
export async function fetchPublishedVideo(): Promise<VideoItem> {
  const all = await fetchAllVideos();
  const published = all.find((v) => v.isPublished);
  return published || all[0] || DEFAULT_VIDEOS[0];
}

/**
 * Adds a new video record.
 */
export async function createVideo(video: {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category: VideoCategory;
  isPublished?: boolean;
  fileSize?: number;
}): Promise<VideoItem> {
  const now = new Date().toISOString();
  const newVideo: VideoItem = {
    id: crypto.randomUUID ? crypto.randomUUID() : `vid_${Date.now()}`,
    title: video.title.trim(),
    description: video.description?.trim() || '',
    videoUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl || '',
    category: video.category,
    isPublished: Boolean(video.isPublished),
    fileSize: video.fileSize,
    createdAt: now,
    updatedAt: now,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      // If setting as published, unpublish all others first
      if (newVideo.isPublished) {
        await supabase.from('videos').update({ is_published: false }).neq('id', newVideo.id);
      }

      const { data, error } = await supabase
        .from('videos')
        .insert({
          id: newVideo.id,
          title: newVideo.title,
          description: newVideo.description,
          video_url: newVideo.videoUrl,
          thumbnail_url: newVideo.thumbnailUrl,
          category: newVideo.category,
          is_published: newVideo.isPublished,
          file_size: newVideo.fileSize,
        })
        .select()
        .single();

      if (!error && data) {
        newVideo.createdAt = data.created_at;
        newVideo.updatedAt = data.updated_at;
      }
    } catch (err) {
      console.warn('createVideo remote failed:', err);
    }
  }

  const local = getLocalVideos();
  const updatedList = newVideo.isPublished
    ? [newVideo, ...local.map((v) => ({ ...v, isPublished: false }))]
    : [newVideo, ...local];
  saveLocalVideos(updatedList);
  return newVideo;
}

/**
 * Sets a specific video as the currently published video on the public site.
 */
export async function publishVideo(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('videos').update({ is_published: false }).neq('id', id);
      const { error } = await supabase.from('videos').update({ is_published: true }).eq('id', id);
      if (error) console.error('publishVideo error:', error);
    } catch (err) {
      console.warn('publishVideo remote error:', err);
    }
  }

  const local = getLocalVideos();
  const updated = local.map((v) => ({
    ...v,
    isPublished: v.id === id,
    updatedAt: new Date().toISOString(),
  }));
  saveLocalVideos(updated);
  return true;
}

/**
 * Unpublishes a video.
 */
export async function unpublishVideo(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('videos').update({ is_published: false }).eq('id', id);
    } catch (err) {
      console.warn('unpublishVideo remote error:', err);
    }
  }

  const local = getLocalVideos();
  const updated = local.map((v) => (v.id === id ? { ...v, isPublished: false } : v));
  saveLocalVideos(updated);
  return true;
}

/**
 * Deletes a video record and its storage object if hosted on Supabase.
 */
export async function deleteVideo(id: string, videoUrl?: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      // If URL belongs to Supabase storage, attempt file deletion
      if (videoUrl && videoUrl.includes('/videos/')) {
        const parts = videoUrl.split('/videos/');
        const path = parts[parts.length - 1];
        if (path) {
          await supabase.storage.from('videos').remove([path]);
        }
      }

      await supabase.from('videos').delete().eq('id', id);
    } catch (err) {
      console.warn('deleteVideo remote error:', err);
    }
  }

  const local = getLocalVideos();
  saveLocalVideos(local.filter((v) => v.id !== id));
  return true;
}

/**
 * Uploads an MP4 video file to Supabase Storage bucket 'videos'.
 */
export async function uploadVideoFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; size: number }> {
  const fileExt = file.name.split('.').pop() || 'mp4';
  const cleanBase = file.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
  const fileName = `vid_${Date.now()}_${cleanBase}.${fileExt}`;

  if (onProgress) onProgress(25);

  if (isSupabaseConfigured && supabase) {
    try {
      if (onProgress) onProgress(50);
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!uploadError) {
        if (onProgress) onProgress(100);
        const { data } = supabase.storage.from('videos').getPublicUrl(fileName);
        if (data?.publicUrl) {
          return { url: data.publicUrl, size: file.size };
        }
      } else {
        console.warn('Supabase video upload failed, falling back:', uploadError);
      }
    } catch (err) {
      console.warn('uploadVideoFile exception:', err);
    }
  }

  // Fallback to URL.createObjectURL or FileReader
  if (onProgress) onProgress(100);
  return {
    url: URL.createObjectURL(file),
    size: file.size,
  };
}
