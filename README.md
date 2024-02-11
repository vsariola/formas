# formas

A javscript 1k intro by pestis, released at LoveByte 2024.

Source: https://github.com/vsariola/formas

Capture: https://www.youtube.com/watch?v=9YunjBxz-AQ

Greets: p01 !!!!!! This intro is basically just built on the scaffoling of EXPI,
so thank you <3 <3 <3! And then: superogue, HellMood, psenough, jeenio, gopher,
jobe, Virgill, nesbox, dave84, TomCat, exoticorn, baze, byteobserver, ferris,
Ped7g, Dresdenboy, okkie, Řrřola, aldroid, hannu, wrighter, sensenstahl, unlord,
noby, LJ, PoroCYon, Blossom, deater, ilmenit, Fready, Jin X, havoc, gasman,
DevEd, bitl, wbcbz7, NR4, Pellicus, GoingDigital, teadrinker, las, mentor,
blueberry, pOWL, fizzer, gargaj, silvia, MartiniMoe, & everyone at the
Sizecoding discord!

Use Edge or Chrome.

Techniques: Canvas, WebAudioAPI, Brotli, Custom parser/packer, dollchan
bytebeat, IFS fractals, more attitude than skills.

## Packing

`node watch-packer-server.js`

## What was learned this time

- The javascript canvas is nice for making IFS fractals: you can recursively
  apply translations, scales and rotations & restore the transforms with
  restore.
- The canvas filter style are an easy way to add cheap post-processing to the
  effect.
- The most difficult part was making the background a bit more interesting than
  just a single color or a simple gradient. I settled for
  repeating-conic-gradient and repeating-linear-gradient. EXPI used the captured
  screenshot of the intro itself as the background, but I wanted to try
  something else this time.
- Sawtooth oscillators combined with resonant filters are awesome :D The filter
  used is essentially the same that 4klang uses, i.e.
  [https://www.musicdsp.org/en/latest/Filters/23-state-variable.html].
  There's two filters, one for each stereo channels.
