plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    namespace = "com.luckygirls.lastwall"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.luckygirls.lastwall"
        minSdk = 26
        targetSdk = 35
        versionCode = 42
        versionName = "2.19.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}
