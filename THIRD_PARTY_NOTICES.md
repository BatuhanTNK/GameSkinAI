# UI component sources

## Included source

Background Paths v2.0.0 — Dorian Baffier / Kokonut UI (MIT):

- Discovered at https://21st.dev/@kokonutd/components/background-paths
- Public author registry: https://kokonutui.com/r/background-paths.json
- Documentation: https://kokonutui.com/docs/backgrounds/background-paths
- Adapted in `src/components/ui/BackgroundPaths.jsx` and `src/assets/css/studio.css`.

The public registry source was converted from TypeScript to JavaScript. The `cn`
utility import was replaced with local class concatenation; the host application
provides content, colors, sizing and line counts. Its canvas animation, pointer
handling, reduced-motion support, observers and cleanup are retained.

## Design references (independently implemented)

- Modern & Stunning sign in — Preet Suthar / HextaUI:
  https://21st.dev/@preetsuthar17/components/modern-stunning-sign-in
- Dashboard with Collapsible Sidebar — Sonu kumar:
  https://21st.dev/@uniquesonu/components/dashboard-with-collapsible-sidebar

These live previews informed the dark authentication portal and collapsible
workspace composition. Their gated source was not copied. The forms, workspace,
navigation, metrics and content were implemented for this application's existing
authentication, credit and conversion APIs. No paid templates are used.

## MIT License

Copyright (c) Dorian Baffier / Kokonut UI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
