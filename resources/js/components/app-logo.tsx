export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md overflow-hidden">
                <img
                    src="/images/eikonify-icon-light.png"
                    alt="Eikonify"
                    className="size-8 dark:hidden"
                />
                <img
                    src="/images/eikonify-icon-dark.png"
                    alt="Eikonify"
                    className="size-8 hidden dark:block"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold font-['Outfit']">
                    Eikonify
                </span>
            </div>
        </>
    );
}
