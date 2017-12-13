/**
 * Set up a global constant to ensure it is not included into a compilation when
 * checking the whole directory, i.e. each file is compiled separately.
 *
 * This is useful to test module augmentations, where you can have multiple
 * augmentations in different files and don't want them to interfere.
 */
declare const someGlobal = 42;