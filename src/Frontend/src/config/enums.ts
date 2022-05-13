export enum AlertSeverity {
  Error   = "error",
  Warning = "warning",
  Info    = "info",
  Success = "success"
}

export enum DateFormat {
  NO = "DD.MM.YYYY"
}

export enum IndustryIdentifier {
  ISBN_10 = "ISBN_10",
  ISBN_13 = "ISBN_13"
}

export enum NoContentFoundMessage {
  DidNotFindWhatYouWereLookingFor  = "notFoundMessage",
  ApiIsDown = "apiIsDown"
}

export enum Paths {
  Overview    = "/",
  Create      = "/book/create",
  Edit        = "/book/edit/:id",
  Details     = "/book/view/:id",
  Loans       = "/loans",
  MyBooks     = "/myBooks",
  Statistics  = "/statistics",
  Wishes      = "/wishes",
  Gdpr        = "/myData"
}

export enum EnvironmentEnum {
  Production = "production",
  Test = "test",
  Local = "local"
}

export enum SortOptions {
  Author            = "sortAuthor",
  AuthorReverse     = "sortAuthorReverse",
  Title             = "sortTitle",
  TitleReverse      = "sortTitleReverse",
  DateAdded         = "sortDateAdded",
  DateAddedReverse  = "sortDateAddedReverse",
  Rating            = "sortRating",
  RatingReverse     = "sortRatingReverse"
}