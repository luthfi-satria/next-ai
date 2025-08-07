export const customSlugify = async (text: string) => {
  let slug = text.toLowerCase()
  // replace & with 'and' for a better SEO and readability
  slug = slug.replace(/&/g, "and")
  // replace non-alphanumeric char, excep hypens and basic latin letters
  slug = slug.replace(/[^a-z0-9\s-]/g, "")
  // replace multiple spaces/hypens with a single hypen
  slug = slug.replace(/[\s-]+/g, "-")
  // trim text
  slug = slug.replace("/^-+|-+$/g", "")

  if (slug == "") {
    return "default-slug"
  }
  return slug
}
