export const localStorageEffect = <T>(key: string) => ({ setSelf, onSet }: { setSelf: Function, onSet: Function }) => {
    const savedValue = localStorage.getItem(key);
    if (savedValue !== null) {
        setSelf(JSON.parse(savedValue));
    }
    onSet((newValue: T, oldValue: T, isReset: T) => {
        if (isReset) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(newValue));
    });
};