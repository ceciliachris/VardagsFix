import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  createService,
  deleteService,
  getAllServices,
  getMyServices,
  updateService,
} from "../../api/serviceApi";
import { api } from "../../api/axios";

vi.mock("../../api/axios", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

describe("serviceApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getAllServices hämtar alla tjänster från rätt endpoint", async () => {
    const services = [{ id: 1, title: "Hundpromenad" }];

    mockedApi.get.mockResolvedValue({ data: services });

    const result = await getAllServices();

    expect(mockedApi.get).toHaveBeenCalledWith("/services");
    expect(result).toEqual(services);
  });

  test("getMyServices hämtar användarens tjänster från rätt endpoint", async () => {
    const services = [{ id: 2, title: "Gräsklippning" }];

    mockedApi.get.mockResolvedValue({ data: services });

    const result = await getMyServices();

    expect(mockedApi.get).toHaveBeenCalledWith("/services/my");
    expect(result).toEqual(services);
  });

  test("createService skickar korrekt data till rätt endpoint", async () => {
    const request = {
      title: "Hundpromenad",
      description: "Promenerar hund",
      price: 200,
      location: "Malmö",
      availableSlots: [
        {
          startTime: "2035-05-01T10:00:00",
          endTime: "2035-05-01T11:00:00",
        },
      ],
    };

    const response = { id: 1, ...request };

    mockedApi.post.mockResolvedValue({ data: response });

    const result = await createService(request);

    expect(mockedApi.post).toHaveBeenCalledWith("/services", request);
    expect(result).toEqual(response);
  });

  test("updateService skickar korrekt data till rätt endpoint", async () => {
    const request = {
      title: "Uppdaterad tjänst",
      description: "Ny beskrivning",
      price: 300,
      location: "Lund",
      availableSlots: [
        {
          startTime: "2035-05-02T10:00:00",
          endTime: "2035-05-02T11:00:00",
        },
      ],
    };

    const response = { id: 5, ...request };

    mockedApi.put.mockResolvedValue({ data: response });

    const result = await updateService(5, request);

    expect(mockedApi.put).toHaveBeenCalledWith("/services/5", request);
    expect(result).toEqual(response);
  });

  test("deleteService anropar rätt endpoint", async () => {
    mockedApi.delete.mockResolvedValue({ data: undefined });

    const result = await deleteService(7);

    expect(mockedApi.delete).toHaveBeenCalledWith("/services/7");
    expect(result).toBeUndefined();
  });
});