/**
 * Used to get Node's namespaceURI type.
 *
 * @internal
 */
export type NamespaceUriType<T extends { namespaceURI: null | string }> = T extends HTMLElement
    ? 'http://www.w3.org/1999/xhtml'
    : T extends SVGElement
    ? 'http://www.w3.org/2000/svg'
    : Exclude<T['namespaceURI'], null>;
