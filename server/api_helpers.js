const axios = require('axios');
const Promise = require('bluebird');

const nextBusAddress = 'http://localhost:3001/agencies/sf-muni';

const getBuses = (req) => {
  return axios.get(`${nextBusAddress}/vehicles`)
    .then(res => {

      // return only the bus route Ids and delete duplicates
      return res.data.map(bus => {
        return bus.routeId;
      }).filter((routeId, index, self) => {
        return index === self.indexOf(routeId);
      });

    })
    .catch(err => {
      console.log('ERROR inside getBuses helper');
    });
};

const getStops = (req) => {
  const { busSelection, direction } = req.query;

  return axios.get(`${nextBusAddress}/routes/${busSelection}`)
    .then(res => {
      const stopsData = {}
      const stopsInfo = res.data.stops;
      const directions = res.data.directions;

      // generate correct stop ids based on direction given
      for (let i = 0; i < directions.length; i++) {
        if (directions[i].shortTitle === direction) {
          let stopIds = directions[i].stops;

          // map correct stop ids to stop names b/c stop ids are required for prediction fetch
          let stopTitles = stopIds.map((stopId) => {
            for (var i = 0; i < stopsInfo.length; i++) {
              if (stopId === stopsInfo[i].id) {
                return stopsInfo[i].title;
              }
            }
          });

          stopIds.forEach((id, i) => {
            stopsData[id] = stopTitles[i];
          });
          return stopsData;

        }
      }
    })
    .catch(err => {
      console.log('ERROR inside getStops helper', err);
    });
};

const getPredictions = (req) => {
  const { busSelection, busStopId } = req.query;
  return axios.get(`${nextBusAddress}/routes/${busSelection}/stops/${busStopId}/predictions`)
    .then(res => {
      const predictions = res.data[0].values;
      return predictions.map(prediction => {
        return prediction.minutes;
      });
    })
    .catch(err => {
      console.log(`yo you got an error in apihelpers inside getPredictions ${err}`);
    });
};

module.exports.getBuses = getBuses;
module.exports.getStops = getStops;
module.exports.getPredictions = getPredictions;
