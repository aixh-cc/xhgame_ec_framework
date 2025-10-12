import { name } from '../../package.json' with { type: 'json' };

export const methods = {
    async open() {
        Editor.Panel.open(name);
    },
    getVersion() {
        return Editor.App.version;
    },
};

export async function load() {
    console.log(`load ${name}`);
}

export function unload() {
    console.log(`unload ${name}`);
}
