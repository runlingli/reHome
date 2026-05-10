import Foundation
import Combine
import CoreLocation

/// One-shot location capture used during registration.
/// Requests "When in Use" authorization, takes a single fix, reverse-geocodes
/// it to a human-readable city/area string, then stops.
@MainActor
final class LocationCapture: NSObject, ObservableObject, CLLocationManagerDelegate {
    enum Phase: Equatable {
        case idle
        case requesting              // permission dialog showing OR fix in flight
        case captured(City)
        case denied                  // user said No to the permission dialog
        case failed(String)
    }

    struct City: Equatable {
        var lat: Double
        var lng: Double
        var label: String            // "Davis, CA" or "Allston, MA"
    }

    @Published private(set) var phase: Phase = .idle

    private let manager  = CLLocationManager()
    private let geocoder = CLGeocoder()

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
    }

    /// Kick off the permission prompt + a single fix.
    func capture() {
        switch manager.authorizationStatus {
        case .notDetermined:
            phase = .requesting
            manager.requestWhenInUseAuthorization()
        case .authorizedWhenInUse, .authorizedAlways:
            phase = .requesting
            manager.requestLocation()
        case .denied, .restricted:
            phase = .denied
        @unknown default:
            phase = .failed("Unknown authorization state.")
        }
    }

    // MARK: - CLLocationManagerDelegate

    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in
            switch manager.authorizationStatus {
            case .authorizedWhenInUse, .authorizedAlways:
                if phase == .requesting { manager.requestLocation() }
            case .denied, .restricted:
                phase = .denied
            default:
                break
            }
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let loc = locations.last else { return }
        let lat = loc.coordinate.latitude
        let lng = loc.coordinate.longitude
        Task { @MainActor in
            do {
                let placemarks = try await geocoder.reverseGeocodeLocation(loc)
                let pm = placemarks.first
                let city  = pm?.locality ?? pm?.subAdministrativeArea ?? "Unknown"
                let state = pm?.administrativeArea
                let label = state.map { "\(city), \($0)" } ?? city
                phase = .captured(.init(lat: lat, lng: lng, label: label))
            } catch {
                // Geocoding failed but we still have coords — report them raw.
                let label = String(format: "%.3f, %.3f", lat, lng)
                phase = .captured(.init(lat: lat, lng: lng, label: label))
            }
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        Task { @MainActor in
            phase = .failed((error as NSError).localizedDescription)
        }
    }
}
