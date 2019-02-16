
// https://support.microsoft.com/zh-cn/help/310516/how-to-add-modify-or-delete-registry-subkeys-and-values-by-using-a-reg

// [Registry]
// #if "user" == InstallTarget
// #define SoftwareClassesRootKey "HKCU"
// #else
// #define SoftwareClassesRootKey "HKLM"
// #endif
// Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\*\shell\{#RegValueName}"; ValueType: expandsz; ValueName: ""; ValueData: "Open w&ith {#ShellNameShort}"; Tasks: addcontextmenufiles; Flags: uninsdeletekey
// Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\*\shell\{#RegValueName}"; ValueType: expandsz; ValueName: "Icon"; ValueData: "{app}\{#ExeBasename}.exe"; Tasks: addcontextmenufiles
// Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\*\shell\{#RegValueName}\command"; ValueType: expandsz; ValueName: ""; ValueData: """{app}\{#ExeBasename}.exe"" ""%1"""; Tasks: addcontextmenufiles
// Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\directory\shell\{#RegValueName}"; ValueType: expandsz; ValueName: ""; ValueData: "Open w&ith {#ShellNameShort}"; Tasks: addcontextmenufolders; Flags: uninsdeletekey
// Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\directory\shell\{#RegValueName}"; ValueType: expandsz; ValueName: "Icon"; ValueData: "{app}\{#ExeBasename}.exe"; Tasks: addcontextmenufolders
// Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\directory\shell\{#RegValueName}\command"; ValueType: expandsz; ValueName: ""; ValueData: """{app}\{#ExeBasename}.exe"" ""%V"""; Tasks: addcontextmenufolders
// Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\directory\background\shell\{#RegValueName}"; ValueType: expandsz; ValueName: ""; ValueData: "Open w&ith {#ShellNameShort}"; Tasks: addcontextmenufolders; Flags: uninsdeletekey
// Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\directory\background\shell\{#RegValueName}"; ValueType: expandsz; ValueName: "Icon"; ValueData: "{app}\{#ExeBasename}.exe"; Tasks: addcontextmenufolders
// Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\directory\background\shell\{#RegValueName}\command"; ValueType: expandsz; ValueName: ""; ValueData: """{app}\{#ExeBasename}.exe"" ""%V"""; Tasks: addcontextmenufolders
// Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\Drive\shell\{#RegValueName}"; ValueType: expandsz; ValueName: ""; ValueData: "Open w&ith {#ShellNameShort}"; Tasks: addcontextmenufolders; Flags: uninsdeletekey
// Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\Drive\shell\{#RegValueName}"; ValueType: expandsz; ValueName: "Icon"; ValueData: "{app}\{#ExeBasename}.exe"; Tasks: addcontextmenufolders
// Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\Drive\shell\{#RegValueName}\command"; ValueType: expandsz; ValueName: ""; ValueData: """{app}\{#ExeBasename}.exe"" ""%V"""; Tasks: addcontextmenufolders

export enum SoftwareClassesRootKey {
    HKCU = 'HKEY_CURRENT_USER',
    HKLM = 'HKEY_LOCAL_MACHINE'
}

export enum Subkey {
    File = '\\Software\\Classes\\*\\shell\\${regValueName}',
    Directory = '\\Software\\Classes\\directory\\shell\\${regValueName}',
    DirectoryBackground = '\\Software\\Classes\\directory\\background\\shell\\${regValueName}',
}

interface IContextMenuItem {
    key: string;
    message: string;
    exePath: string;
    arg: string;
    shift?: boolean;
}

export class RegEdit {
    header: string;
    contextMenuItems: Map<string, IContextMenuItem>;

    regValueName: string;
    shellNameShort: string;
    exeBasename: string;

    constructor() {
        this.header = 'Windows Registry Editor Version 5.00\n';
        this.contextMenuItems = new Map();
    
        this.regValueName = 'VSCode';
        this.shellNameShort = 'Code';
        this.exeBasename = 'Code';
    }

    public set(softwareClassesRootKey: SoftwareClassesRootKey, subkey: Subkey, exePath: string, shift?: boolean): void {
        let key = softwareClassesRootKey + subkey.replace(/\$\{regValueName\}/g, this.regValueName);
        this.contextMenuItems.set(key, {
            key: key,
            message: `Open with ${this.shellNameShort}`,
            exePath: exePath.replace(/\\/g, '\\\\'),
            arg: subkey === Subkey.File ? "%1" : "%V",
            shift: shift
        });
    }

    public delete(softwareClassesRootKey: SoftwareClassesRootKey, subkey: Subkey) {
        let key = softwareClassesRootKey + subkey.replace(/\$\{regValueName\}/g, this.regValueName);
        this.contextMenuItems.delete(key);
    }

    public clear() {
        this.contextMenuItems.clear();
    }

    public getInstall(): string {
        let str = this.header;
        this.contextMenuItems.forEach((item, _) => {
            if(item.shift) {
                str += 
`
[${item.key}]
@="${item.message}"
"Extended"=""
"Icon"="${item.exePath}"

[${item.key}\\command]
@="\\\"${item.exePath}\\\" \\\"${item.arg}\\\""
`;
            } else {
                str += 
`
[${item.key}]
@="${item.message}"
"Icon"="${item.exePath}"

[${item.key}\\command]
@="\\\"${item.exePath}\\\" \\\"${item.arg}\\\""
`;
            }
        });
        return str;
    }

    public getUninstall(): string {
        let str = this.header;
        this.contextMenuItems.forEach((item, _) => {
            str +=
`
[-${item.key}]

[-${item.key}\\command]
`;
        });
        return str;
    }

}