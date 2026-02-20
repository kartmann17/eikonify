import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    const { className = '', ...rest } = props;
    return (
        <>
            <img
                {...rest}
                src="/images/eikonify-icon-light.png"
                alt="Eikonify"
                className={`${className} dark:hidden`}
            />
            <img
                {...rest}
                src="/images/eikonify-icon-dark.png"
                alt="Eikonify"
                className={`${className} hidden dark:block`}
            />
        </>
    );
}
