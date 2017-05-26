# Grafana cruise track Leaflet map panel

* Create two InfluxDB queries
* One should return decimal degree latitude values, aliased as lat or latitude
* One should return decimal degree longitude values, aliased as lon or longitude


### Install

```
cp -r dist /var/lib/grafana/plugins/armbrustlab-cruisetrack-panel
```
Then restart Grafana to pick up the new plugin.

Or if you want to start from a fresh grunt pipeline build.

```
npm install
grunt
cp -r dist /var/lib/grafana/plugins/armbrustlab-cruisetrack-panel
```
And restart Grafana.
