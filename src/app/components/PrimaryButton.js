export default function PrimaryButton({ texto, onClick }) {
    return (
        <div
            onClick={onClick || (() => window.history.back())}
            className="flex items-center justify-center w-full h-[48px] cursor-pointer bg-[#f37021] text-[#ffffff] hover:opacity-90 transition rounded-[100px]"
        >
            <h5>{texto}</h5>
        </div>
    );
}
