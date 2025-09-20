'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { NAVBAR_LINKS } from '../../constants/NAVBAR_LINKS';

export function NavbarDesktop() {
    const pathname = usePathname();

    return (
        <nav className="flex inter  items-center justify-between w-full px-6">
            <div className="flex gap-6">
                {NAVBAR_LINKS.map((link) => (
                    <Link
                        key={link.path}
                        href={link.path}
                        className={clsx(
                            'font-[600] text-lg hover:underline transition-colors',
                            pathname === link.path ? 'text-primary' : 'text-gray-700',
                        )}
                    >
                        {link.title}
                    </Link>
                ))}
            </div>
        </nav>
    );
}
