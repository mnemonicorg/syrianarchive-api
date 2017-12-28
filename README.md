# Syrian Archive API

A node server api to query and access `sugarcube-cid` units.  The metadata for the units is outlayed in `sugarcube-cid`.

The api stores a .json file in memory, and runs reductions and transformations to serve.  It is a database-less api.

To supply the api with data, add the following files with following to the `data` directory:

  - units.json
  - meta.json

These can be generated with the `cid-publisher` (at this moment not public.)

Sample data has been supplied in the data directory.

## development

to run

copy env.example to env and fill in

npm install

npm run dev.
