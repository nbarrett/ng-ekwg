export function slideClasses(slideCount: number, marginBottom: string = "") {
  console.log("slideCount", slideCount,"marginBottom:",marginBottom);
  switch (slideCount) {
    case 4:
      return (marginBottom + " col-sm-12 col-md-6 col-lg-4 col-xl-3").trim();
    case 3:
      return (marginBottom + " col-sm-12 col-md-6 col-lg-4 col-xl-4").trim();
    case 2:
      return (marginBottom + " col-sm-12 col-md-6 col-lg-6 col-xl-6").trim();
    case 1:
      return (marginBottom + " col-sm-12").trim();
    default :
      return (marginBottom + " col-sm-12 col-md-6 col-lg-4 col-xl-3").trim();
  }
}


