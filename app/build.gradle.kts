plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val githubRunNumber = System.getenv("GITHUB_RUN_NUMBER")?.toIntOrNull()
val buildNumber = githubRunNumber ?: 1
val baseVersionName = "0.4.0-stage1-rpg-boss-prototype"

android {
    namespace = "com.luckygirls.lastwall"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.luckygirls.lastwall"
        minSdk = 26
        targetSdk = 35
        versionCode = 2000 + buildNumber
        versionName = "$baseVersionName-r$buildNumber"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}
