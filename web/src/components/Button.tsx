import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "lg" | "icon";

interface BaseProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: ReactNode;
    className?: string;
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

interface ButtonLinkProps extends BaseProps {
    to?: string;
    href?: string;
    external?: boolean;
}

function getClassName(variant: ButtonVariant, size: ButtonSize, className?: string): string {
    return [styles.button, styles[variant], styles[size], className].filter(Boolean).join(" ");
}

export function Button({ variant = "primary", size = "md", className, children, type = "button", ...rest }: ButtonProps) {
    return (
        <button type={type} className={getClassName(variant, size, className)} {...rest}>
            {children}
        </button>
    );
}

export function ButtonLink({ variant = "primary", size = "md", className, children, to, href, external = false }: ButtonLinkProps) {
    const classNames = getClassName(variant, size, className);

    if (to) {
        return (
            <Link to={to} className={classNames}>
                {children}
            </Link>
        );
    }

    return (
        <a href={href} className={classNames} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
            {children}
        </a>
    );
}
