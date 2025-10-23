import axios from 'axios';

export interface NanonvanaApiResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export class NanonvanaService {
  private static readonly API_BASE_URL = 'https://api.nanonvana.com'; // 실제 API URL로 변경 필요
  private static readonly API_KEY = import.meta.env.VITE_NANONVANA_API_KEY || '';

  static async generateImageFromSketch(
    sketchImageData: string,
    prompt?: string
  ): Promise<NanonvanaApiResponse> {
    try {
      const response = await axios.post(
        `${this.API_BASE_URL}/generate`,
        {
          image: sketchImageData,
          prompt: prompt || 'Convert this sketch to a realistic product image',
          style: 'realistic',
          quality: 'high'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30초 타임아웃
        }
      );

      return {
        success: true,
        imageUrl: response.data.imageUrl
      };
    } catch (error) {
      console.error('Nanonvana API Error:', error);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || error.message
        };
      }
      
      return {
        success: false,
        error: 'Unknown error occurred'
      };
    }
  }

  static async generateImageFromPrompt(prompt: string): Promise<NanonvanaApiResponse> {
    try {
      const response = await axios.post(
        `${this.API_BASE_URL}/text-to-image`,
        {
          prompt: prompt,
          style: 'realistic',
          quality: 'high',
          size: '1024x1024'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        imageUrl: response.data.imageUrl
      };
    } catch (error) {
      console.error('Nanonvana API Error:', error);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || error.message
        };
      }
      
      return {
        success: false,
        error: 'Unknown error occurred'
      };
    }
  }
}
