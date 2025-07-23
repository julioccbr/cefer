export default function SecondaryButton({ texto, onClick }) {
    return (
        <div
            onClick={onClick || (() => window.history.back())}
            className="flex items-center justify-center w-full h-[48px] cursor-pointer hover:opacity-90 transition rounded-[100px]"
        >
            <p className="textoIV">{texto}</p>
        </div>
    );
}
