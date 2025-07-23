import Link from "next/link";

export default function CardComponent({ id, title, description, image, baseUrl }) {
    return (
        <Link href={`/${baseUrl}/${id}`}>
            <div className="flex flex-row h-[108px] rounded-lg overflow-hidden bg-[#fff] shadow-[0_8px_8px_0_rgba(0,0,0,0.05)] cursor-pointer hover:shadow-md transition-shadow duration-200">
                <div className="flex-none w-[108px] h-full">
                    <img src={image} alt={title} className="size-full object-cover" />
                </div>

                <div className="flex flex-col flex-grow px-[20px] py-[16px] justify-between">
                    <div className="flex flex-col gap-[4px]">
                        <h6>{title}</h6>
                        <p className="textoIII line-clamp-2">{description}</p>
                    </div>
                    <p className="text-[10px] font-[700] text-[#F37021]"> Clique para saber mais!</p>
                </div>
            </div>
        </Link>
    );
}
