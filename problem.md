## clue 1

Uncaught TypeError: Cannot convert object to primitive value
at installHook.js:1:59987
at String.replace (<anonymous>)
at formatConsoleArgumentsToSingleString (installHook.js:1:59930)
at onErrorOrWarning (installHook.js:1:144942)
at console.overrideMethod [as error] (installHook.js:1:167845)
at lazyInitializer (react.js?v=b35cf5f8:292:368)
at Object.react_stack_bottom_frame (react-dom_client.js?v=b35cf5f8:12914:11)
at resolveLazy (react-dom_client.js?v=b35cf5f8:3484:12)
at beginWork (react-dom_client.js?v=b35cf5f8:6120:66)
at runWithFiberInDEV (react-dom_client.js?v=b35cf5f8:851:66)
(anonymous) @ installHook.js:1
formatConsoleArgumentsToSingleString @ installHook.js:1
onErrorOrWarning @ installHook.js:1
overrideMethod @ installHook.js:1
lazyInitializer @ react.js?v=b35cf5f8:292
react_stack_bottom_frame @ react-dom_client.js?v=b35cf5f8:12914
resolveLazy @ react-dom_client.js?v=b35cf5f8:3484
beginWork @ react-dom_client.js?v=b35cf5f8:6120
runWithFiberInDEV @ react-dom_client.js?v=b35cf5f8:851
performUnitOfWork @ react-dom_client.js?v=b35cf5f8:8429
workLoopConcurrentByScheduler @ react-dom_client.js?v=b35cf5f8:8425
renderRootConcurrent @ react-dom_client.js?v=b35cf5f8:8408
performWorkOnRoot @ react-dom_client.js?v=b35cf5f8:7957
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=b35cf5f8:9059
performWorkUntilDeadline @ react-dom_client.js?v=b35cf5f8:36
<...>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=b35cf5f8:193
(anonymous) @ index.jsx:56
installHook.js:1 Uncaught TypeError: Cannot convert object to primitive value
at installHook.js:1:59987
at String.replace (<anonymous>)
at formatConsoleArgumentsToSingleString (installHook.js:1:59930)
at onErrorOrWarning (installHook.js:1:144942)
at console.overrideMethod [as error] (installHook.js:1:167845)
at lazyInitializer (react.js?v=b35cf5f8:292:368)
at Object.react_stack_bottom_frame (react-dom_client.js?v=b35cf5f8:12914:11)
at resolveLazy (react-dom_client.js?v=b35cf5f8:3484:12)
at beginWork (react-dom_client.js?v=b35cf5f8:6120:66)
at runWithFiberInDEV (react-dom_client.js?v=b35cf5f8:851:66)
(anonymous) @ installHook.js:1
formatConsoleArgumentsToSingleString @ installHook.js:1
onErrorOrWarning @ installHook.js:1
overrideMethod @ installHook.js:1
lazyInitializer @ react.js?v=b35cf5f8:292
react_stack_bottom_frame @ react-dom_client.js?v=b35cf5f8:12914
resolveLazy @ react-dom_client.js?v=b35cf5f8:3484
beginWork @ react-dom_client.js?v=b35cf5f8:6120
runWithFiberInDEV @ react-dom_client.js?v=b35cf5f8:851
performUnitOfWork @ react-dom_client.js?v=b35cf5f8:8429
workLoopSync @ react-dom_client.js?v=b35cf5f8:8325
renderRootSync @ react-dom_client.js?v=b35cf5f8:8309
performWorkOnRoot @ react-dom_client.js?v=b35cf5f8:7994
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=b35cf5f8:9059
performWorkUntilDeadline @ react-dom_client.js?v=b35cf5f8:36
<...>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=b35cf5f8:193
(anonymous) @ index.jsx:56
installHook.js:1 TypeError: Cannot convert object to primitive value
at String (<anonymous>)
at error (<anonymous>)
at console.overrideMethod [as error] (installHook.js:1:168574)
at lazyInitializer (react.js?v=b35cf5f8:292:368)
at Object.react_stack_bottom_frame (react-dom_client.js?v=b35cf5f8:12914:11)
at resolveLazy (react-dom_client.js?v=b35cf5f8:3484:12)
at beginWork (react-dom_client.js?v=b35cf5f8:6120:66)
at runWithFiberInDEV (react-dom_client.js?v=b35cf5f8:851:66)
at performUnitOfWork (react-dom_client.js?v=b35cf5f8:8429:92)
at workLoopSync (react-dom_client.js?v=b35cf5f8:8325:37)

The above error occurred in one of your React components.

React will try to recreate this component tree from scratch using the error boundary you provided, RenderErrorBoundary.

overrideMethod @ installHook.js:1
defaultOnCaughtError @ react-dom_client.js?v=b35cf5f8:5274
logCaughtError @ react-dom_client.js?v=b35cf5f8:5300
runWithFiberInDEV @ react-dom_client.js?v=b35cf5f8:851
inst.componentDidCatch.update.callback @ react-dom_client.js?v=b35cf5f8:5339
callCallback @ react-dom_client.js?v=b35cf5f8:4095
commitCallbacks @ react-dom_client.js?v=b35cf5f8:4103
runWithFiberInDEV @ react-dom_client.js?v=b35cf5f8:851
commitClassCallbacks @ react-dom_client.js?v=b35cf5f8:6663
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:6970
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=b35cf5f8:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:6958
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=b35cf5f8:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:7047
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=b35cf5f8:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:7047
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=b35cf5f8:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:6958
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=b35cf5f8:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:7047
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=b35cf5f8:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:7047
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=b35cf5f8:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:7047
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=b35cf5f8:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:7047
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=b35cf5f8:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:6958
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=b35cf5f8:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:6958
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=b35cf5f8:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:7047
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=b35cf5f8:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:6958
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=b35cf5f8:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:6958
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=b35cf5f8:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:6958
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=b35cf5f8:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:6958
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=b35cf5f8:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:6962
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=b35cf5f8:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=b35cf5f8:6975
flushLayoutEffects @ react-dom_client.js?v=b35cf5f8:8671
commitRoot @ react-dom_client.js?v=b35cf5f8:8584
commitRootWhenReady @ react-dom_client.js?v=b35cf5f8:8079
<...>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=b35cf5f8:193
(anonymous) @ index.jsx:56
installHook.js:1 React Router caught the following error during render TypeError: Cannot convert object to primitive value
at String (<anonymous>)
at error (<anonymous>)
at console.overrideMethod [as error] (installHook.js:1:168574)
at lazyInitializer (react.js?v=b35cf5f8:292:368)
at Object.react_stack_bottom_frame (react-dom_client.js?v=b35cf5f8:12914:11)
at resolveLazy (react-dom_client.js?v=b35cf5f8:3484:12)
at beginWork (react-dom_client.js?v=b35cf5f8:6120:66)
at runWithFiberInDEV (react-dom_client.js?v=b35cf5f8:851:66)
at performUnitOfWork (react-dom_client.js?v=b35cf5f8:8429:92)
at workLoopSync (react-dom_client.js?v=b35cf5f8:8325:37)

## clue 3

RenderErrorBoundary
React Router caught the following error during render TypeError: Cannot convert object to primitive value

## clue 3

Something went wrong
Cannot convert object to primitive value

## Resolution

The lazy route crash was fixed by adding `export default` to the seven `React.lazy`-loaded page modules.

A second, separate issue caused note saves to never reach the API: `frontend/src/lib/fetchWithAuth.js` constructed a plain-object `combinedSignal` and passed it as `RequestInit.signal`. Browsers require a real `AbortSignal`, so `fetch` threw a `TypeError` before any request was sent. Only the autosave path passed a signal (`useAutoSave` -> `saveDraft` -> `useUpdateNote`), which is why note saving failed while other requests worked. `fetchWithAuth` now uses a real `AbortController` per attempt, bridges the caller signal, wires the timeout, and ignores the caller signal for keepalive requests.
