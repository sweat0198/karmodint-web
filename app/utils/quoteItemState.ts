/** Move ephemeral Customize-page state alongside a quote line when configuration re-keying changes its id. */
export function moveQuoteItemState<T>(state: Record<string, T>, fromId: string, toId: string): void {
  if (fromId === toId || !Object.hasOwn(state, fromId)) return
  state[toId] = state[fromId]!
  delete state[fromId]
}
