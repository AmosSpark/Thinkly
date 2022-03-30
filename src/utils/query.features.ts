class QueryFeatures {
  query: object | any;
  queryStr: object | any;
  constructor(query: object, queryStr: object) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    // A - Basic build
    // exclude other query fileds when filtering
    const queryObj: { [key: string]: string } = { ...this.queryStr },
      excludedFileds: string[] = ["page", "limit", "sort", "fields"];

    excludedFileds.forEach((el) => delete queryObj[el]);

    // B - Advance build
    // prefix $ to filter methods e.g gt = $gt
    let queryStr: string = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    // Find query
    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      // default sort - sort by highest avg. rating
      this.query = this.query.sort("-averageRating");
    }

    return this;
  }

  limitFileds() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      // exclude __v in response
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const page: number = Number(this.queryStr.page) || 1,
      limit: number = Number(this.queryStr.limit) || 10,
      skip: number = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default QueryFeatures;
