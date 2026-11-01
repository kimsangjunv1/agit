const RenewalProjectItem = ({ title, text }: { title: string; text: string }) => {
    return (
        <section className="flex flex-col gap-[1.6rem]">
            <div className="w-fill h-fill obect bg-[#00000020] aspect-video" />

            <section>
                <h5>{title}</h5>
                <p>{text}</p>
            </section>
        </section>
    );
};

export default RenewalProjectItem;
