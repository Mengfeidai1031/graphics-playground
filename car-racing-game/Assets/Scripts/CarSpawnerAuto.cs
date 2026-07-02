using UnityEngine;
using System.Linq;

public class CarSpawnerAuto : MonoBehaviour
{
    [Header("Asignar Coches Manualmente Aquí")]
    [Tooltip("Arrastra los 8 modelos de coches aquí")]
    public GameObject[] carPrefabs; // AHORA PÚBLICO PARA ASIGNACIÓN MANUAL
    
    private GameObject spawnedCar;
    private Vector3 spawnPosition = new Vector3(50, 5, 50);
    
    void Start()
    {
        // Si no hay coches asignados manualmente, intentar auto-detectar
        if (carPrefabs == null || carPrefabs.Length == 0)
        {
            Debug.LogWarning("No hay coches asignados manualmente. Intentando auto-detectar...");
            AutoFindCars();
        }
        else
        {
            Debug.Log($"✓ {carPrefabs.Length} coches disponibles");
        }
        
        SpawnSelectedCar();
        SetupCamera();
    }
    
    void AutoFindCars()
    {
        var allObjects = Resources.LoadAll<GameObject>("");
        var cars = allObjects.Where(obj => IsLikelyCar(obj)).ToArray();
        
        if (cars.Length > 0)
        {
            carPrefabs = cars.Take(8).ToArray();
            Debug.Log($"Auto-detectados {carPrefabs.Length} coches");
        }
    }
    
    bool IsLikelyCar(GameObject obj)
    {
        string name = obj.name.ToLower();
        if (name.Contains("car") || name.Contains("vehicle") || name.Contains("auto"))
            return true;
            
        Transform[] children = obj.GetComponentsInChildren<Transform>();
        int wheelCount = 0;
        
        foreach (Transform child in children)
        {
            if (child.name.ToLower().Contains("wheel"))
                wheelCount++;
        }
        
        return wheelCount >= 2;
    }
    
    void SpawnSelectedCar()
    {
        if (carPrefabs == null || carPrefabs.Length == 0)
        {
            Debug.LogError("⚠ NO HAY COCHES DISPONIBLES. Asigna los coches manualmente en el Inspector del CarSpawner.");
            return;
        }
        
        // Obtener el índice del coche seleccionado
        int carIndex = PlayerPrefs.GetInt("SelectedCarIndex", 0);
        
        // Verificar que el índice sea válido
        if (carIndex >= carPrefabs.Length || carIndex < 0)
        {
            carIndex = 0;
        }
        
        // Verificar que el prefab no sea null
        if (carPrefabs[carIndex] == null)
        {
            Debug.LogError($"El coche en el índice {carIndex} es null. Asigna todos los coches correctamente.");
            return;
        }
        
        spawnedCar = Instantiate(carPrefabs[carIndex], spawnPosition, Quaternion.identity);
        spawnedCar.tag = "Player";
        
        SetupCarPhysics(spawnedCar);
        AddCarController(spawnedCar);
        
        Debug.Log($"✓ Coche spawneado: {spawnedCar.name}");
    }
    
    void SetupCarPhysics(GameObject car)
    {
        Rigidbody rb = car.GetComponent<Rigidbody>();
        if (rb == null)
        {
            rb = car.AddComponent<Rigidbody>();
        }
        
        rb.mass = 1200;
        rb.linearDamping = 0.05f;
        rb.angularDamping = 0.5f;
        rb.interpolation = RigidbodyInterpolation.Interpolate;
        rb.collisionDetectionMode = CollisionDetectionMode.Continuous;
        
        if (car.GetComponent<Collider>() == null)
        {
            BoxCollider box = car.AddComponent<BoxCollider>();
            box.center = new Vector3(0, 0.5f, 0);
            box.size = new Vector3(1.8f, 1f, 4f);
        }
    }
    
    void AddCarController(GameObject car)
    {
        CarControllerAuto controller = car.AddComponent<CarControllerAuto>();
        AutoSetupWheels(car, controller);
    }
    
    void AutoSetupWheels(GameObject car, CarControllerAuto controller)
    {
        // Primero intentar encontrar ruedas existentes en el modelo
        Transform[] allChildren = car.GetComponentsInChildren<Transform>();
        
        WheelCollider[] existingWheels = new WheelCollider[4];
        int foundWheels = 0;
        
        // Buscar WheelColliders existentes
        foreach (Transform child in allChildren)
        {
            WheelCollider wc = child.GetComponent<WheelCollider>();
            if (wc != null)
            {
                foundWheels++;
            }
        }
        
        // Si el modelo ya tiene WheelColliders configurados, usarlos
        if (foundWheels >= 4)
        {
            Debug.Log("El coche ya tiene WheelColliders configurados");
            AssignExistingWheels(car, controller);
            return;
        }
        
        // Si no, crear WheelColliders pero SIN mesh visual
        GameObject wheelsParent = new GameObject("WheelColliders");
        wheelsParent.transform.SetParent(car.transform);
        wheelsParent.transform.localPosition = Vector3.zero;
        
        Renderer[] renderers = car.GetComponentsInChildren<Renderer>();
        Bounds bounds = new Bounds(car.transform.position, Vector3.zero);
        foreach (Renderer r in renderers)
        {
            bounds.Encapsulate(r.bounds);
        }
        
        float carLength = bounds.size.z;
        float carWidth = bounds.size.x;
        float wheelRadius = 0.35f;
        
        Vector3[] wheelPositions = new Vector3[]
        {
            new Vector3(-carWidth * 0.4f, wheelRadius * 0.5f, carLength * 0.35f),
            new Vector3(carWidth * 0.4f, wheelRadius * 0.5f, carLength * 0.35f),
            new Vector3(-carWidth * 0.4f, wheelRadius * 0.5f, -carLength * 0.35f),
            new Vector3(carWidth * 0.4f, wheelRadius * 0.5f, -carLength * 0.35f)
        };
        
        string[] wheelNames = new string[] { "WheelFL", "WheelFR", "WheelRL", "WheelRR" };
        
        for (int i = 0; i < 4; i++)
        {
            GameObject wheelObj = new GameObject(wheelNames[i]);
            wheelObj.transform.SetParent(wheelsParent.transform);
            wheelObj.transform.localPosition = wheelPositions[i];
            
            WheelCollider wc = wheelObj.AddComponent<WheelCollider>();
            ConfigureWheelCollider(wc, wheelRadius);
            
            if (i == 0) controller.frontLeftWheel = wc;
            else if (i == 1) controller.frontRightWheel = wc;
            else if (i == 2) controller.rearLeftWheel = wc;
            else if (i == 3) controller.rearRightWheel = wc;
            
            // NO crear mesh visual
        }
        
        Debug.Log("✓ WheelColliders creados sin mesh visual");
    }
    
    void AssignExistingWheels(GameObject car, CarControllerAuto controller)
    {
        Transform[] allChildren = car.GetComponentsInChildren<Transform>();
        
        foreach (Transform child in allChildren)
        {
            WheelCollider wc = child.GetComponent<WheelCollider>();
            if (wc == null) continue;
            
            string name = child.name.ToLower();
            
            if (name.Contains("front") && name.Contains("left"))
                controller.frontLeftWheel = wc;
            else if (name.Contains("front") && name.Contains("right"))
                controller.frontRightWheel = wc;
            else if (name.Contains("rear") && name.Contains("left") || name.Contains("back") && name.Contains("left"))
                controller.rearLeftWheel = wc;
            else if (name.Contains("rear") && name.Contains("right") || name.Contains("back") && name.Contains("right"))
                controller.rearRightWheel = wc;
        }
    }
    
    void ConfigureWheelCollider(WheelCollider wc, float radius)
    {
        wc.radius = radius;
        wc.wheelDampingRate = 0.25f;
        wc.suspensionDistance = 0.3f;
        wc.forceAppPointDistance = 0f;
        wc.mass = 20f;
        
        JointSpring spring = wc.suspensionSpring;
        spring.spring = 35000f;
        spring.damper = 4500f;
        spring.targetPosition = 0.5f;
        wc.suspensionSpring = spring;
        
        WheelFrictionCurve forwardFriction = wc.forwardFriction;
        forwardFriction.extremumSlip = 0.4f;
        forwardFriction.extremumValue = 1f;
        forwardFriction.asymptoteSlip = 0.8f;
        forwardFriction.asymptoteValue = 0.5f;
        forwardFriction.stiffness = 1.5f;
        wc.forwardFriction = forwardFriction;
        
        WheelFrictionCurve sidewaysFriction = wc.sidewaysFriction;
        sidewaysFriction.extremumSlip = 0.2f;
        sidewaysFriction.extremumValue = 1f;
        sidewaysFriction.asymptoteSlip = 0.5f;
        sidewaysFriction.asymptoteValue = 0.75f;
        sidewaysFriction.stiffness = 1.5f;
        wc.sidewaysFriction = sidewaysFriction;
    }
    
    void CreateWheelMesh(GameObject wheelObj, float radius)
    {
        // NO CREAR MESH VISUAL - El coche ya tiene sus propias ruedas
        // Dejamos solo el WheelCollider para la física
        Debug.Log("WheelCollider creado sin mesh visual");
    }
    
    void SetupCamera()
    {
        if (spawnedCar == null) return;
        
        Camera mainCam = Camera.main;
        if (mainCam == null)
        {
            GameObject camObj = new GameObject("Main Camera");
            mainCam = camObj.AddComponent<Camera>();
            camObj.tag = "MainCamera";
            camObj.AddComponent<AudioListener>();
        }
        
        CameraFollowAuto camFollow = mainCam.gameObject.GetComponent<CameraFollowAuto>();
        if (camFollow == null)
        {
            camFollow = mainCam.gameObject.AddComponent<CameraFollowAuto>();
        }
        
        camFollow.target = spawnedCar.transform;
    }
    
    public GameObject GetSpawnedCar()
    {
        return spawnedCar;
    }
}