<template>
    <ol class="grid w-full dark:bg-stone-800 oswald-font tracking-wide font-extralight aspect-square border border-black overflow-clip"
        style="
     grid-template-columns: 1.5fr repeat(9, 1fr) 1.5fr;
     grid-template-rows: 1.5fr repeat(9, 1fr) 1.5fr;
      grid-template-areas:
  'c20 c21 c22 c23 c24 c25 c26 c27 c28 c29 c30'
  'c19 mid mid mid mid mid mid mid mid mid c31'
  'c18 mid mid mid mid mid mid mid mid mid c32'
  'c17 mid mid mid mid mid mid mid mid mid c33'
  'c16 mid mid mid mid mid mid mid mid mid c34'
  'c15 mid mid mid mid mid mid mid mid mid c35'
  'c14 mid mid mid mid mid mid mid mid mid c36'
  'c13 mid mid mid mid mid mid mid mid mid c37'
  'c12 mid mid mid mid mid mid mid mid mid c38'
  'c11 mid mid mid mid mid mid mid mid mid c39'
  'c10 c9  c8  c7  c6  c5  c4  c3  c2  c1  c0';
    ">
        <slot></slot>
    </ol>
</template>