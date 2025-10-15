<template>
  <div class="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(94,234,212,0.14)_0,_transparent_45%),radial-gradient(circle_at_25%_80%,_rgba(59,130,246,0.12)_0,_transparent_55%)]"
    />

    <div class="relative flex min-h-screen flex-col lg:flex-row">
      <aside
        class="order-2 hidden border-t border-slate-800/60 bg-slate-950/75 backdrop-blur lg:order-1 lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-20 lg:flex-col lg:border-r lg:border-t-0"
      >
        <div class="flex h-full flex-col items-center gap-4 px-3 py-4">
          <slot name="sidebar" />
        </div>
      </aside>

      <main class="order-1 flex-1 lg:order-2 lg:ml-20">
        <div class="flex min-h-screen flex-col">
          <div class="sticky top-0 z-20 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur">
            <slot name="topbar" />
          </div>
          <div class="flex-1 overflow-y-auto px-4 pb-24 pt-6 sm:px-8 lg:pb-10 lg:pt-8">
            <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:gap-8">
              <slot />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>

  <div
    v-if="$slots['mobile-nav']"
    class="lg:hidden fixed inset-x-0 bottom-0 border-t border-slate-800/70 bg-slate-900/95 backdrop-blur"
  >
    <slot name="mobile-nav" />
  </div>
</template>
