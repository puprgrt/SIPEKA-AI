#!/bin/bash
awk '
  /const handleLogin =/ {
    print "  const handleGoogleLogin = async () => {"
    print "    try {"
    print "      setIsLoading(true);"
    print "      await googleSignIn();"
    print "      navigate(\"/\");"
    print "    } catch (error) {"
    print "      console.error(\"Google sign in failed\", error);"
    print "    } finally {"
    print "      setIsLoading(false);"
    print "    }"
    print "  };"
    print ""
  }
  {print}
' src/pages/auth/Login.tsx > temp.tsx && mv temp.tsx src/pages/auth/Login.tsx
