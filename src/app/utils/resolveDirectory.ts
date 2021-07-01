export default function resolveDirectory(urlString: string, rootDirectoryLevel: number = 1) {
    // Our friend IE11 doesn't support new URL()
    // https://github.com/single-spa/single-spa/issues/612
    // https://gist.github.com/jlong/2428561

    const a = document.createElement('a');
    a.href = urlString;

    /* istanbul ignore next */
    const pathname = a.pathname[0] === '/' ? a.pathname : '/' + a.pathname;
    let numDirsProcessed = 0;
    let index = pathname.length;
    while (numDirsProcessed !== rootDirectoryLevel && index >= 0) {
        const char = pathname[--index];
        if (char === '/') {
            numDirsProcessed++;
        }
    }

    if (numDirsProcessed !== rootDirectoryLevel) {
        // tslint:disable-next-line:no-console
        console.warn(
            'ilc-webpack-plugins: rootDirectoryLevel (' +
                rootDirectoryLevel +
                ') is greater than the number of directories (' +
                numDirsProcessed +
                ') in the URL path ' +
                urlString,
        );
    }

    const finalPath = pathname.slice(0, index + 1) || '/';

    return a.protocol + '//' + a.host + finalPath;
}
