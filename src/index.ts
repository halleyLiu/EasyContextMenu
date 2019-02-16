import { SoftwareClassesRootKey, Subkey, RegEdit } from './regedit'

let exePath = 'C:\\Users\\halley\\OneDrive\\Software\\VSCode\\Code.exe';

let regedit = new RegEdit();
regedit.push(SoftwareClassesRootKey.HKCU, Subkey.File, exePath);
regedit.push(SoftwareClassesRootKey.HKCU, Subkey.Directory, exePath);
regedit.push(SoftwareClassesRootKey.HKCU, Subkey.DirectoryBackground, exePath);
console.log(regedit.getInstall());
console.log(regedit.getUninstall());
