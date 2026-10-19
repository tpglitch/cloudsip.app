import { getSettings, saveSettings } from './settings-store.js';

const PROVISIONING_FIELDS = [
  'extension',
  'sipDomain',
  'websocketUrl',
  'sipUri',
  'displayName',
  'password',
  'autoAnswer',
  'autoRecordCalls',
  'autoHoldOnSwitch',
  'theme'
];

function getProvisioningSettings(payload){
  const source = payload && typeof payload === 'object' && payload.settings && typeof payload.settings === 'object'
    ? payload.settings
    : payload;

  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    throw new Error('Provisioning JSON must contain a settings object.');
  }

  const settings = Object.fromEntries(
    PROVISIONING_FIELDS
      .filter((key) => Object.prototype.hasOwnProperty.call(source, key))
      .map((key) => [key, source[key]])
  );

  if (!Object.keys(settings).length) {
    throw new Error('The provisioning file does not contain any supported settings.');
  }

  return settings;
}

export async function importProvisioningFile(file){
  if (!file) throw new Error('Choose a provisioning file first.');

  const text = await file.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch (error) {
    throw new Error('The provisioning file is not valid JSON.');
  }

  return saveSettings({
    ...getSettings(),
    ...getProvisioningSettings(payload)
  });
}

export function exportProvisioningFile(){
  const settings = getSettings();
  const provisioning = {
    settings: Object.fromEntries(PROVISIONING_FIELDS.map((key) => [key, settings[key]]))
  };
  const blob = new Blob([JSON.stringify(provisioning, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cloudsip-provisioning.json';
  link.click();
  URL.revokeObjectURL(url);
}
