import { createContext, useContext, useState, useEffect } from "react";

const MyListContext = createContext(null);

export function MyListProvider({ children }) {
  const [myList, setMyList] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("netflix_my_list");
    if (stored) {
      try {
        setMyList(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("netflix_my_list");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("netflix_my_list", JSON.stringify(myList));
  }, [myList]);

  const addToList = (item) => {
    if (!myList.some((i) => i.id === item.id)) {
      setMyList((prev) => [...prev, item]);
    }
  };

  const removeFromList = (id) => {
    setMyList((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleInList = (item) => {
    const exists = myList.some((i) => i.id === item.id);
    if (exists) removeFromList(item.id);
    else addToList(item);
  };

  const isInList = (id) => myList.some((i) => i.id === id);

  return (
    <MyListContext.Provider value={{ myList, addToList, removeFromList, toggleInList, isInList }}>
      {children}
    </MyListContext.Provider>
  );
}

export function useMyList() {
  const ctx = useContext(MyListContext);
  if (!ctx) return { myList: [], addToList: () => {}, removeFromList: () => {}, toggleInList: () => {}, isInList: () => false };
  return ctx;
}
