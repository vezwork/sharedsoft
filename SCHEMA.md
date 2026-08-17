### Background

This is a peer to peer expense sharing application. Each device using this application
holds its own copy of the data. Devices exchange messages to share state. There is
an underlying message exchange protocol for sharing state, but we won't go into that here. Each device application should agree on the app data schema, and we should be able to
understand what the schema means.

### The data schema for this application

Pseudo typed code to describe the schema:

```
eventData = {
    who: 'sharon' | 'elliot'    // who payed. They are owed the amount
    amount: Number.toFixed(2)   // the amount owed by the other person
    currency: String            // e.g. CAD, USD, EUR, etc.
    category: String            // e.g. grocery, etc. see `groupedCategories` for a list
    name: String                // name or title of the expense
    date: 'YYYY-MM-DD'
    method:

        // this case means fullAmount and amount were manually entered
        { fullAmount: Number.toFixed(2) } |

        // this case means amount was calculated from fullAmount by
        // `amount = (Number(fullAmount) / Number(split)).toFixed(2)`
        // note: for odd cent ammounts, this rounds amount up
        // e.g. `0.26 = (0.51/2).toFixed(2)`
        { fullAmount: Number.toFixed(2), split: Number.toFixed(2) }
}
```
