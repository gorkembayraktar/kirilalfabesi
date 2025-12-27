import { createContext, useContext, useState } from 'react';

const SequentialLearningContext = createContext(null);

export function SequentialLearningProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    return (
        <SequentialLearningContext.Provider value={{ isOpen, openModal, closeModal }}>
            {children}
        </SequentialLearningContext.Provider>
    );
}

export function useSequentialLearning() {
    const context = useContext(SequentialLearningContext);
    if (!context) {
        throw new Error('useSequentialLearning must be used within SequentialLearningProvider');
    }
    return context;
}

