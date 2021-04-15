# Global API

ILC exposes some utility APIs globally at `window.ILC`. 
[Full documentation available here](https://namecheap.github.io/ilc-sdk/classes/app.globalbrowserapi.html).

A typed version of the API (preferred way of usage) is available in the following way:

```javascript
import { GlobalBrowserApi } from 'ilc-sdk/app';

GlobalBrowserApi.navigate('/mypath');
```