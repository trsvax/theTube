# Tasks — Share System (Phase 1)

## Task 1: Rename and refactor block renderer
- [ ] Rename `renderDesignBlocks` to `renderBlocks` in `lib/posts.ts`
- [ ] Extract common block-parsing logic (detect tag, consume key-value lines, emit or strip)

## Task 2: Add `[share]:` block renderer
- [ ] Parse `[share]:` blocks (type, file, captured, caption, src)
- [ ] When `src:` present: render as `<figure class="share-image">` with `<img>` and `<figcaption>`
- [ ] When `src:` absent: strip entirely (emit nothing)

## Task 3: Strip agent blocks from output
- [ ] Strip `[claude]:` blocks (consume lines until blank, emit nothing)
- [ ] Strip `[kiro]:` blocks (consume lines until blank, emit nothing)

## Task 4: Add share CSS
- [ ] Add `.share-image` styles to `globals.css` (figure, img, figcaption)
- [ ] Add `.share-placeholder` styles (stretch goal — dashed border, centered text)

## Task 5: Update blocks.md
- [x] Add `[share]:` entry to blocks.md registry
- [x] Document agent block stripping behavior

## Task 6: Test with a real post
- [ ] Add a `[share]:` block (with `src:`) to a test post and verify it renders as `<figure>`
- [ ] Add a `[share]:` block (without `src:`) and verify it's stripped
- [ ] Verify `[claude]:` and `[kiro]:` blocks in the-share-system.md are stripped from rendered output
- [ ] Run `npm run build` and confirm no errors

## Task 7: iOS Shortcut (manual)
- [ ] Create "Save to Tube" Shortcut accepting share input
- [ ] Add type detection logic (image/link/note)
- [ ] Add caption prompt
- [ ] POST to `/tube/share/add?type=...&file=...&date=...&caption=...`
- [ ] Store JWT in Shortcut variable or Keychain
- [ ] Test: share a photo, confirm 202 response

## Task 8: Update the post's `[kiro]:` block
- [ ] Add `spec: .kiro/specs/share` to the `[kiro]:` block in `the-share-system.md`
