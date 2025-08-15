import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="fr">
            <Head>
                <meta charSet="utf-8" />
                <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
