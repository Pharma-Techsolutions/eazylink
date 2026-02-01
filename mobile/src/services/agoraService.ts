import RtcEngine, {
  RtcEngineConfig,
  ChannelProfile,
  ClientRole,
  AudioVolumeInfo,
} from 'react-native-agora';

import { callAPI } from './api';

let engine: RtcEngine;
let isInitialized = false;

export const AgoraService = {
  async initialize(appId: string) {
    try {
      if (isInitialized) return;

      // Create RTC Engine
      engine = await RtcEngine.create({ appId });

      // Set channel profile to communication
      await engine.setChannelProfile(ChannelProfile.Communication);

      // Set client role as broadcaster
      await engine.setClientRole(ClientRole.Broadcaster);

      // Enable audio
      await engine.enableAudio();

      isInitialized = true;
      console.log('✓ Agora initialized');
    } catch (error) {
      console.error('Agora init error:', error);
      throw error;
    }
  },

  async getToken(channelName: string, uid: number): Promise<string> {
    try {
      const response = await callAPI.agoraAPI.getToken(channelName, uid);
      return response.data.token;
    } catch (error) {
      console.error('Failed to get Agora token:', error);
      throw error;
    }
  },

  async joinChannel(channelName: string, uid: number) {
    try {
      const token = await this.getToken(channelName, uid);

      await engine.joinChannel(token, channelName, null, uid);
      console.log(`✓ Joined channel: ${channelName}`);
    } catch (error) {
      console.error('Join channel error:', error);
      throw error;
    }
  },

  async leaveChannel() {
    try {
      await engine.leaveChannel();
      console.log('✓ Left channel');
    } catch (error) {
      console.error('Leave channel error:', error);
    }
  },

  async destroy() {
    try {
      await engine.destroy();
      isInitialized = false;
      console.log('✓ Agora destroyed');
    } catch (error) {
      console.error('Destroy error:', error);
    }
  },

  async muteAudio(muted: boolean) {
    try {
      await engine.muteLocalAudioStream(muted);
      console.log(muted ? '✓ Muted' : '✓ Unmuted');
    } catch (error) {
      console.error('Mute error:', error);
    }
  },

  async enableSpeakerphone(enabled: boolean) {
    try {
      await engine.setDefaultAudioRouteToSpeakerphone(enabled);
      console.log(enabled ? '✓ Speakerphone on' : '✓ Speakerphone off');
    } catch (error) {
      console.error('Speakerphone error:', error);
    }
  },
};
