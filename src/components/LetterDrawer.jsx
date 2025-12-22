import LetterTable from './LetterTable';

export default function LetterDrawer({ isOpen, onClose }) {
    return (
        <>
            <div
                className={`drawer-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />
            <div className={`drawer ${isOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <h3>Harf Tablosu</h3>
                    <button className="drawer-close-btn" onClick={onClose}>✕</button>
                </div>
                <div className="drawer-content">
                    <LetterTable />
                </div>
            </div>
        </>
    );
}
