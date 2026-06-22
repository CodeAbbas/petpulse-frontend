const { withAndroidManifest } = require('@expo/config-plugins');

const withFirebaseManifestFix = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    
    // Ensure the Android tools XML namespace is declared
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    const application = manifest.application[0];
    if (!application['meta-data']) {
      application['meta-data'] = [];
    }

    // Locate the conflicting Firebase channel ID meta-data tag
    let channelMetaData = application['meta-data'].find(
      (item) => item.$['android:name'] === 'com.google.firebase.messaging.default_notification_channel_id'
    );

    // Inject the tools:replace attribute to force resolution
    if (channelMetaData) {
      channelMetaData.$['tools:replace'] = 'android:value';
    } else {
      application['meta-data'].push({
        $: {
          'android:name': 'com.google.firebase.messaging.default_notification_channel_id',
          'android:value': 'default',
          'tools:replace': 'android:value',
        },
      });
    }

    return config;
  });
};

module.exports = withFirebaseManifestFix;