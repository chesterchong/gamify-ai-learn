const sanitizeDatabaseUrl = (databaseUrl) => {
  if (!databaseUrl) {
    return databaseUrl
  }

  try {
    const url = new URL(databaseUrl)
    url.searchParams.delete('sslmode')
    url.searchParams.delete('sslrootcert')
    url.searchParams.delete('sslcert')
    url.searchParams.delete('sslkey')
    return url.toString()
  } catch (error) {
    return databaseUrl
  }
}

const getDatabaseUrl = () => sanitizeDatabaseUrl(process.env.DATABASE_URL)

export { getDatabaseUrl }
