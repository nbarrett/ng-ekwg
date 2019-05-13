angular.module('ekwgApp')
  .factory('BatchGeoExportService', function(StringUtils, DateUtils, $filter) {

    function exportWalksFileName() {
      return 'batch-geo-walks-export-' + DateUtils.asMoment().format('DD-MMMM-YYYY-HH-mm') + '.csv'
    }

    function exportableWalks(walks) {
      return _(walks).sortBy('walkDate');
    }

    function exportWalks(walks) {
      return _.chain(walks)
        .filter(filterWalk)
        .sortBy('walkDate')
        .last(250)
        .map(walkToCsvRecord)
        .value();
    }

    function filterWalk(walk) {
      return _.has(walk, 'briefDescriptionAndStartPoint')
        && (_.has(walk, 'gridReference') || _.has(walk, 'postcode'));
    }

    function exportColumnHeadings() {
      return [
        "Walk Date",
        "Start Time",
        "Postcode",
        "Contact Name/Email",
        "Distance",
        "Description",
        "Longer Description",
        "Grid Ref"
      ];
    }

    function walkToCsvRecord(walk) {
      return {
        "walkDate": walkDate(walk),
        "startTime": walkStartTime(walk),
        "postcode": walkPostcode(walk),
        "displayName": contactDisplayName(walk),
        "distance": walkDistanceMiles(walk),
        "description": walkTitle(walk),
        "longerDescription": walkDescription(walk),
        "gridRef": walkGridReference(walk)
      };
    }

    function walkTitle(walk) {
      var walkDescription = [];
      if (walk.includeWalkDescriptionPrefix) walkDescription.push(walk.walkDescriptionPrefix);
      if (walk.briefDescriptionAndStartPoint) walkDescription.push(walk.briefDescriptionAndStartPoint);
      return _.chain(walkDescription).map(replaceSpecialCharacters).value().join('. ');
    }

    function walkDescription(walk) {
      return replaceSpecialCharacters(walk.longerDescription);
    }

    function asString(value) {
      return value ? value : '';
    }

    function contactDisplayName(walk) {
      return walk.displayName ? replaceSpecialCharacters(_.first(walk.displayName.split(' '))) : '';
    }

    function replaceSpecialCharacters(value) {
      return value ? StringUtils.stripLineBreaks(value
        .replace("’", "'")
        .replace("é", "e")
        .replace("â€™", "'")
        .replace('â€¦', '…')
        .replace('â€“', '–')
        .replace('â€™', '’')
        .replace('â€œ', '“')) : '';
    }

    function walkDistanceMiles(walk) {
      return walk.distance ? String(parseFloat(walk.distance).toFixed(1)) : '';
    }

    function walkStartTime(walk) {
      return walk.startTime ? DateUtils.asString(walk.startTime, 'HH mm', 'HH:mm') : '';
    }

    function walkGridReference(walk) {
      return walk.gridReference ? walk.gridReference : '';
    }

    function walkPostcode(walk) {
      return walk.postcode ? walk.postcode : '';
    }

    function walkDate(walk) {
      return $filter('displayDate')(walk.walkDate);
    }

    return {
      exportWalksFileName: exportWalksFileName,
      exportWalks: exportWalks,
      exportableWalks: exportableWalks,
      exportColumnHeadings: exportColumnHeadings
    }
  });