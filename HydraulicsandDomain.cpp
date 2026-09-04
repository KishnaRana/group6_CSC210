#ifndef HYDRAULICS_H
#define HYDRAULICS_H

#include <string>
#include <vector>

// Represents a node/junction in the distribution grid
struct Node {
    std::string id;
    double elevation_m;
    double pressure_psi;
    double pollutant_concentration; // 0.0 to 1.0 scale
};

// Represents a pipe segment connecting two nodes
struct Pipe {
    std::string id;
    std::string start_node;
    std::string end_node;
    double length_m;
    double diameter_m;
    double roughness_c; // Hazen-Williams coefficient (e.g., 130 for PVC/smooth iron)
    double flow_rate_lps; // Liters per second
};

class WaterNetworkSimulator {
private:
    std::vector<Node> nodes;
    std::vector<Pipe> pipes;

public:
    void addNode(const std::string& id, double elevation, double initial_pressure);
    void addPipe(const std::string& id, const std::string& start, const std::string& end, double length, double diameter, double roughness);
    
    // Calculates pressure drop across a pipe segment (Hazen-Williams formula)
    double calculatePressureDrop(const Pipe& pipe);

    // Simulates an unauthorized inline suction pump causing a pressure drop
    void simulateSuctionPump(const std::string& node_id, double pump_draw_lps);

    // Simulates 1D advection of contamination down a pipe line over time step dt
    void simulateContaminationFlow(const std::string& pipe_id, double concentration_input, double dt_sec);

    void displayStatus() const;
};

#endif
