
const fetchFromLocalStorage = (item) => {
    return JSON.parse(localStorage.getItem(item));
};

const saveToLocalStorage = (item, value) => {
    localStorage.setItem(item, JSON.stringify(value));
};
