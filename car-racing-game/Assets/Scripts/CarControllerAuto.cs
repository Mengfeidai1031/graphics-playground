using UnityEngine;

[RequireComponent(typeof(Rigidbody))]
public class CarControllerAuto : MonoBehaviour
{
    [Header("Configuración Auto-detectada")]
    public float motorPower = 2000f;
    public float brakePower = 4000f;
    public float maxSteerAngle = 35f;
    public float maxSpeed = 120f;
    
    [Header("Ruedas (Auto-asignadas)")]
    public WheelCollider frontLeftWheel;
    public WheelCollider frontRightWheel;
    public WheelCollider rearLeftWheel;
    public WheelCollider rearRightWheel;
    
    private float currentSteerAngle;
    private float currentBrakeForce;
    private Rigidbody rb;
    
    void Start()
    {
        rb = GetComponent<Rigidbody>();
        rb.centerOfMass = new Vector3(0, -0.3f, 0.2f);
        
        // Ajustar potencia según nombre del coche
        AdjustCarStats();
    }
    
    void AdjustCarStats()
    {
        string carName = gameObject.name.ToLower();
        
        // Diferentes características según el tipo de coche
        if (carName.Contains("1"))
        {
            motorPower = 5000f;
            maxSpeed = 210f;
            maxSteerAngle = 50f;
            rb.mass = 500f;
        }
        else if (carName.Contains("2"))
        {
            motorPower = 3000f;
            maxSpeed = 160f;
            maxSteerAngle = 40f;
            rb.mass = 800f;
        }
        else if (carName.Contains("3"))
        {
            motorPower = 8000f;
            maxSpeed = 230f;
            maxSteerAngle = 50f;
            rb.mass = 700f;
        }
        else if (carName.Contains("4"))
        {
            motorPower = 5000f;
            maxSpeed = 200f;
            maxSteerAngle = 50f;
            rb.mass = 700f;
        }
        else if (carName.Contains("5"))
        {
            motorPower = 3000f;
            maxSpeed = 180f;
            maxSteerAngle = 50f;
            rb.mass = 700f;
        }
        else if (carName.Contains("6"))
        {
            motorPower = 8000f;
            maxSpeed = 2400f;
            maxSteerAngle = 50f;
            rb.mass = 700f;
        }
        else if (carName.Contains("7"))
        {
            motorPower = 9500f;
            maxSpeed = 280f;
            maxSteerAngle = 60f;
            rb.mass = 500f;
        }
        else if (carName.Contains("8"))
        {
            motorPower = 5000f;
            maxSpeed = 150f;
            maxSteerAngle = 50f;
            rb.mass = 1200f;
        }
        
        Debug.Log($"Características del coche ajustadas: Motor={motorPower}, MaxSpeed={maxSpeed}");
    }
    
    void FixedUpdate()
    {
        HandleMotor();
        HandleSteering();
        UpdateWheelMeshes();
    }
    
    void HandleMotor()
    {
        float verticalInput = Input.GetAxis("Vertical");
        
        // Limitar velocidad máxima
        if (rb.linearVelocity.magnitude * 3.6f < maxSpeed)
        {
            float torque = verticalInput * motorPower;
            rearLeftWheel.motorTorque = torque;
            rearRightWheel.motorTorque = torque;
        }
        else
        {
            rearLeftWheel.motorTorque = 0;
            rearRightWheel.motorTorque = 0;
        }
        
        // Freno
        currentBrakeForce = Input.GetKey(KeyCode.Space) ? brakePower : 0f;
        ApplyBraking();
    }
    
    void ApplyBraking()
    {
        frontLeftWheel.brakeTorque = currentBrakeForce;
        frontRightWheel.brakeTorque = currentBrakeForce;
        rearLeftWheel.brakeTorque = currentBrakeForce;
        rearRightWheel.brakeTorque = currentBrakeForce;
    }
    
    void HandleSteering()
    {
        float horizontalInput = Input.GetAxis("Horizontal");
        currentSteerAngle = maxSteerAngle * horizontalInput;
        
        frontLeftWheel.steerAngle = currentSteerAngle;
        frontRightWheel.steerAngle = currentSteerAngle;
    }
    
    void UpdateWheelMeshes()
    {
        UpdateWheelMesh(frontLeftWheel);
        UpdateWheelMesh(frontRightWheel);
        UpdateWheelMesh(rearLeftWheel);
        UpdateWheelMesh(rearRightWheel);
    }
    
    void UpdateWheelMesh(WheelCollider collider)
    {
        if (collider == null) return;
        
        Transform meshTransform = collider.transform.Find("WheelMesh");
        if (meshTransform == null) return;
        
        Vector3 pos;
        Quaternion quat;
        collider.GetWorldPose(out pos, out quat);
        
        meshTransform.position = pos;
        meshTransform.rotation = quat;
    }
    
    public float GetCurrentSpeed()
    {
        return rb.linearVelocity.magnitude * 3.6f; // km/h
    }
}